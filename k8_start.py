#!/usr/bin/env python3
import subprocess
import time
import textwrap
import sys
from pathlib import Path
import shutil
import argparse

# Constants
DEFAULT_IMAGE_REPO = "screambunn/jadn_sandbox"
DEFAULT_IMAGE_TAG = "latest"

NAMESPACE = "jadn-sandbox"
LOCAL_FORWARD_PORT = 8080
CONTAINER_PORT = 8082
INGRESS_HOST = "jadn-sandbox.local"

# Resolve paths relative to this file so it works even if run from elsewhere
ROOT_DIR = Path(__file__).resolve().parent
MANIFEST_DIR = ROOT_DIR / "deploy" / "k8"

CONFIG_PATH = MANIFEST_DIR / "config.yaml"
DEPLOYMENT_PATH = MANIFEST_DIR / "deployment.yaml"
SERVICE_PATH = MANIFEST_DIR / "service.yaml"
INGRESS_PATH = MANIFEST_DIR / "ingress.yaml"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Bootstrap plain K8s deployment of the JADN Sandbox."
    )
    parser.add_argument(
        "-i", "--image",
        help=(
            "Docker image to deploy. "
            "Examples: 'screambunn/jadn_sandbox', "
            "'screambunn/jadn_sandbox:mytag'. "
            "If no tag is provided, ':latest' will be used. "
            f"Default: '{DEFAULT_IMAGE_REPO}:{DEFAULT_IMAGE_TAG}'."
        ),
        default=f"{DEFAULT_IMAGE_REPO}:{DEFAULT_IMAGE_TAG}",
    )
    parser.add_argument(
        "--skip-load",
        action="store_true",
        help="Skip loading the Docker image into minikube. Use this if deploying to a remote cluster.",
    )
    return parser.parse_args()


def normalize_image(image_str: str) -> str:
    """
    If image_str has no tag (no ':' after the last '/'), append :latest.
    Otherwise, return as-is.
    """
    # Split on '/' to look at the last segment
    last_segment = image_str.split("/")[-1]
    if ":" not in last_segment:
        return f"{image_str}:{DEFAULT_IMAGE_TAG}"
    return image_str


def run(cmd, check=False):
    """Run a shell command and return the CompletedProcess."""
    print(f"📦 Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        # kubectl is noisy; only print stderr if non-empty
        print(result.stderr.strip())
    if check and result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result


def ensure_tools():
    """Ensure kubectl is installed."""
    if shutil.which("kubectl") is None:
        print("❌ kubectl not found in PATH. Please install kubectl first.")
        sys.exit(1)


def load_image_to_minikube(image: str):
    """Load the Docker image into minikube's Docker daemon."""
    if shutil.which("minikube") is None:
        print("⚠️ minikube not found in PATH. Skipping image load.")
        return
    
    print(f"📥 Loading image '{image}' into minikube...")
    result = subprocess.run(
        ["minikube", "image", "load", image],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"✅ Image '{image}' loaded into minikube.")
    else:
        print(f"⚠️ Failed to load image into minikube: {result.stderr}")
        print("   Kubernetes will attempt to pull from registry instead.")


def delete_namespace():
    """Delete the namespace if it exists, then wait for it to disappear."""
    print(f"🧹 Deleting namespace '{NAMESPACE}' if it exists...")
    run(["kubectl", "delete", "namespace", NAMESPACE, "--ignore-not-found=true"])

    # Wait for deletion to complete
    print("⏳ Waiting for namespace deletion...")
    for _ in range(60):
        result = subprocess.run(
            ["kubectl", "get", "namespace", NAMESPACE],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if result.returncode != 0:
            print(f"✅ Namespace '{NAMESPACE}' is gone.")
            return
        time.sleep(1)

    print(f"⚠️ Namespace '{NAMESPACE}' still exists after waiting; continuing anyway.")


def write_file(path: Path, content: str):
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    print(f"📝 Wrote {path.relative_to(ROOT_DIR)}")


def generate_manifests(image: str):
    """Generate basic ConfigMap, Deployment, Service, and Ingress YAML."""
    print("🧾 Generating Kubernetes manifests under deploy/k8/ ...")

    configmap = textwrap.dedent(f"""
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {NAMESPACE}-config
      namespace: {NAMESPACE}
      labels:
        app: jadn-sandbox
    data:
      API_BASE_URL: "http://{INGRESS_HOST}"
      ENVIRONMENT: "dev"
    """).lstrip()

    deployment = textwrap.dedent(f"""
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: jadn-sandbox
      namespace: {NAMESPACE}
      labels:
        app: jadn-sandbox
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: jadn-sandbox
      template:
        metadata:
          labels:
            app: jadn-sandbox
        spec:
          containers:
            - name: jadn-sandbox
              image: "{image}"
              imagePullPolicy: IfNotPresent
              ports:
                - containerPort: {CONTAINER_PORT}
              env:
                - name: API_BASE_URL
                  valueFrom:
                    configMapKeyRef:
                      name: {NAMESPACE}-config
                      key: API_BASE_URL
                - name: ENVIRONMENT
                  valueFrom:
                    configMapKeyRef:
                      name: {NAMESPACE}-config
                      key: ENVIRONMENT
    """).lstrip()

    service = textwrap.dedent(f"""
    apiVersion: v1
    kind: Service
    metadata:
      name: jadn-sandbox
      namespace: {NAMESPACE}
      labels:
        app: jadn-sandbox
    spec:
      type: ClusterIP
      selector:
        app: jadn-sandbox
      ports:
        - port: 80
          targetPort: {CONTAINER_PORT}
          protocol: TCP
          name: http
    """).lstrip()

    ingress = textwrap.dedent(f"""
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: jadn-sandbox
      namespace: {NAMESPACE}
      labels:
        app: jadn-sandbox
      annotations:
        nginx.ingress.kubernetes.io/rewrite-target: /
    spec:
      rules:
        - host: {INGRESS_HOST}
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: jadn-sandbox
                    port:
                      number: 80
    """).lstrip()

    write_file(CONFIG_PATH, configmap)
    write_file(DEPLOYMENT_PATH, deployment)
    write_file(SERVICE_PATH, service)
    write_file(INGRESS_PATH, ingress)


def apply_manifests():
    """Create namespace and apply manifests from deploy/k8/."""
    print(f"📂 Applying manifests in namespace '{NAMESPACE}'...")
    run(["kubectl", "create", "namespace", NAMESPACE], check=False)

    for path in [CONFIG_PATH, DEPLOYMENT_PATH, SERVICE_PATH, INGRESS_PATH]:
        run(["kubectl", "apply", "-f", str(path)], check=True)


def wait_for_pods():
    """Wait until all pods in the namespace are 1/1 Running."""
    print("⏳ Waiting for pods to become Ready...")
    for _ in range(60):
        result = run(["kubectl", "get", "pods", "-n", NAMESPACE, "--no-headers"])
        if result.returncode == 0 and result.stdout.strip():
            lines = result.stdout.strip().splitlines()
            # All pods must be 1/1 and Running
            if all("1/1" in line and "Running" in line for line in lines):
                print("✅ All pods are 1/1 Running.")
                return True
        time.sleep(2)

    print("❌ Pods failed to reach Ready state in time.")
    return False


def port_forward():
    """Start a kubectl port-forward from localhost:8080 -> container port."""
    print(
        f"\n🔁 Starting port-forward: localhost:{LOCAL_FORWARD_PORT} "
        f"→ {CONTAINER_PORT} in namespace '{NAMESPACE}' ..."
    )
    print("   Press Ctrl+C to stop port-forward.\n")
    # This will run until interrupted
    subprocess.run(
        [
            "kubectl",
            "port-forward",
            "deployment/jadn-sandbox",
            f"{LOCAL_FORWARD_PORT}:{CONTAINER_PORT}",
            "-n",
            NAMESPACE,
        ]
    )


def main():
    args = parse_args()
    raw_image = args.image
    image = normalize_image(raw_image)

    print("🚀 JADN Sandbox plain K8s bootstrap starting...")
    print(f"   Using image: {image}")
    ensure_tools()
    
    # Load image into minikube unless skipped
    if not args.skip_load:
        load_image_to_minikube(image)
    else:
        print("⏭️ Skipping image load (--skip-load specified).")
    
    delete_namespace()
    generate_manifests(image)
    apply_manifests()

    if not wait_for_pods():
        sys.exit(1)

    print("\n🎉 JADN Sandbox is deployed on Kubernetes.")
    print(f"   - Namespace: {NAMESPACE}")
    print(f"   - Image:     {image}")
    print(f"   - Service:   ClusterIP on port 80 → container {CONTAINER_PORT}")
    print(f"   - Ingress:   host http://{INGRESS_HOST} (if your /etc/hosts is configured)")
    print(f"\nYou can now open:  http://localhost:{LOCAL_FORWARD_PORT} "
          f"(via port-forward) or http://{INGRESS_HOST}/ if routed.\n")

    # Start port-forward so it's immediately testable
    port_forward()


if __name__ == "__main__":
    main()
