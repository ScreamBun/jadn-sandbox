import subprocess
import time
import toml


path_to_toml = "./server/webApp/data/version.toml"

version_data = toml.load(path_to_toml)
major = version_data["major"]
minor = version_data["minor"]
bug = version_data["bug"]
build_hash = version_data["build_hash"]
build_date_in_millis = version_data["build_date_in_millis"]

curr_version = f"v{major}.{minor}.{bug}_{build_date_in_millis}"

print(f"Current Version: {curr_version}")
print(f"Docker Build Hash: {curr_version}")

print("Enter a New Version #")
new_major = int(input("New Major #: "))
new_minor = int(input("New Minor #: "))
new_bug = int(input("New Bug #: "))

new_build_date_in_millis = round(time.time()*1000)

new_full_version = f"v{new_major}.{new_minor}.{new_bug}_{new_build_date_in_millis}"
print(f"New Version: {new_full_version}")

answer = input("Continue? ")
if not answer.lower() in ["y","yes"]:
     exit()

print("saving new version...")
version_data["major"] = new_major
version_data["minor"] = new_minor
version_data["bug"] = new_bug
version_data["build_date_in_millis"] = new_build_date_in_millis
version_data["full_version"] = new_full_version

f = open(path_to_toml,'w')
toml.dump(version_data, f)
f.close()
print("New version saved")

print("Pushing new docker image...")
subprocess.run(["./docker_push.sh", curr_version, new_full_version])
print("Docker image pushed")


