#!/usr/bin/env python3
import subprocess
import time
import sys
from pathlib import Path
import shutil
import argparse

# Constants
DEFAULT_IMAGE_REPO = "screambunn/jadn_sandbox"
DEFAULT_IMAGE_TAG = "latest"

NAMESPACE = "jadn-sandbox"
RELEASE_NAME = "jadn-sandbox"
LOCAL_FORWARD_PORT = 8080
CONTAINER_PORT = 8082
INGRESS_HOST = "jadn-sandbox.local"

# Resolve paths relative to this file so it works even if run from elsewhere
ROOT_DIR = Path(__file__).resolve().parent
HELM_CHART_DIR = ROOT_DIR / "deploy" / "helm" / "jadn-sandbox"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Bootstrap Helm deployment of the JADN Sandbox."
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
    parser.add_argument(
        "--upgrade",
        action="store_true",
        help="Upgrade an existing release instead of installing fresh.",
    )
    return parser.parse_args()


def normalize_image(image_str: str) -> tuple[str, str]:
    """
    Parse image string into repository and tag.
    Returns (repository, tag) tuple.
    """
    if ":" in image_str.split("/")[-1]:
        repo, tag = image_str.rsplit(":", 1)
        return repo, tag
    return image_str, DEFAULT_IMAGE_TAG


def run(cmd, check=False):
    """Run a shell command and return the CompletedProcess."""
    print(f"📦 Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        # helm/kubectl can be noisy; only print stderr if non-empty
        print(result.stderr.strip())
    if check and result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result


def ensure_tools():
    """Ensure kubectl and helm are installed."""
    if shutil.which("kubectl") is None:
        print("❌ kubectl not found in PATH. Please install kubectl first.")
        sys.exit(1)
    
    if shutil.which("helm") is None:
        print("❌ helm not found in PATH. Please install Helm first.")
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


def create_namespace():
    """Create the namespace if it doesn't exist."""
    print(f"📂 Creating namespace '{NAMESPACE}'...")
    run(["kubectl", "create", "namespace", NAMESPACE], check=True)


def helm_install(image_repo: str, image_tag: str):
    """Install the Helm chart."""
    print(f"📊 Installing Helm chart from {HELM_CHART_DIR}...")
    
    if not HELM_CHART_DIR.exists():
        print(f"❌ Helm chart directory not found at {HELM_CHART_DIR}")
        print("   Please ensure the Helm chart exists in deploy/helm/jadn-sandbox/")
        sys.exit(1)
    
    cmd = [
        "helm", "install", RELEASE_NAME,
        str(HELM_CHART_DIR),
        "-n", NAMESPACE,
        "--set", f"image.repository={image_repo}",
        "--set", f"image.tag={image_tag}",
        "--set", f"image.pullPolicy=IfNotPresent",
        "--set", f"service.port=80",
        "--set", f"service.targetPort={CONTAINER_PORT}",
        "--set", f"ingress.enabled=true",
        "--set", f"ingress.hosts[0].host={INGRESS_HOST}",
        "--set", f"ingress.hosts[0].paths[0].path=/",
        "--set", f"ingress.hosts[0].paths[0].pathType=Prefix",
    ]
    
    run(cmd, check=True)


def helm_upgrade(image_repo: str, image_tag: str):
    """Upgrade the existing Helm release."""
    print(f"🔄 Upgrading Helm release '{RELEASE_NAME}'...")
    
    if not HELM_CHART_DIR.exists():
        print(f"❌ Helm chart directory not found at {HELM_CHART_DIR}")
        print("   Please ensure the Helm chart exists in deploy/helm/jadn-sandbox/")
        sys.exit(1)
    
    cmd = [
        "helm", "upgrade", RELEASE_NAME,
        str(HELM_CHART_DIR),
        "-n", NAMESPACE,
        "--set", f"image.repository={image_repo}",
        "--set", f"image.tag={image_tag}",
        "--set", f"image.pullPolicy=IfNotPresent",
        "--set", f"service.port=80",
        "--set", f"service.targetPort={CONTAINER_PORT}",
        "--set", f"ingress.enabled=true",
        "--set", f"ingress.hosts[0].host={INGRESS_HOST}",
        "--set", f"ingress.hosts[0].paths[0].path=/",
        "--set", f"ingress.hosts[0].paths[0].pathType=Prefix",
    ]
    
    run(cmd, check=True)


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
        f"→ 80 (service) → {CONTAINER_PORT} (container) in namespace '{NAMESPACE}' ..."
    )
    print("   Press Ctrl+C to stop port-forward.\n")
    # This will run until interrupted
    # Port-forward to service port 80, which forwards to container port 8082
    subprocess.run(
        [
            "kubectl",
            "port-forward",
            f"service/{RELEASE_NAME}",
            f"{LOCAL_FORWARD_PORT}:80",
            "-n",
            NAMESPACE,
        ]
    )


def main():
    args = parse_args()
    raw_image = args.image
    image_repo, image_tag = normalize_image(raw_image)
    full_image = f"{image_repo}:{image_tag}"

    print("🚀 JADN Sandbox Helm deployment starting...")
    print(f"   Using image: {full_image}")
    ensure_tools()
    
    # Load image into minikube unless skipped
    if not args.skip_load:
        load_image_to_minikube(full_image)
    else:
        print("⏭️ Skipping image load (--skip-load specified).")
    
    if args.upgrade:
        # For upgrade, just upgrade the existing release
        helm_upgrade(image_repo, image_tag)
    else:
        # For fresh install, delete namespace completely to avoid conflicts
        delete_namespace()
        create_namespace()
        helm_install(image_repo, image_tag)

    if not wait_for_pods():
        sys.exit(1)

    print("\n🎉 JADN Sandbox is deployed on Kubernetes via Helm.")
    print(f"   - Namespace:     {NAMESPACE}")
    print(f"   - Release:       {RELEASE_NAME}")
    print(f"   - Image:         {full_image}")
    print(f"   - Service:       ClusterIP on port 80 → container {CONTAINER_PORT}")
    print(f"   - Ingress:       host http://{INGRESS_HOST} (if your /etc/hosts is configured)")
    print(f"\nYou can now open:  http://localhost:{LOCAL_FORWARD_PORT} "
          f"(via port-forward) or http://{INGRESS_HOST}/ if routed.\n")

    # Start port-forward so it's immediately testable
    port_forward()


if __name__ == "__main__":
    main()
