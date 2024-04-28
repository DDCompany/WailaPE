import json
import os
import os.path as path
import shutil
import subprocess
import zipfile
from urllib import request
from urllib.error import URLError

commit_hash = "fc668229adf3f135a4e3bbfe7684c13d51bbf597"
toolchain_url = f"https://github.com/zheka2304/innercore-mod-toolchain/archive/{commit_hash}.zip"

temp_zip_path = "./toolchain.zip"
root_dir = f"innercore-mod-toolchain-{commit_hash}"


def cleanup():
    if path.exists(root_dir):
        shutil.rmtree(root_dir)

    if path.exists(temp_zip_path):
        os.remove(temp_zip_path)


def install_toolchain():
    cleanup()

    needed_files = list()
    needed_files.append("toolchain")

    for file in needed_files:
        if path.exists(file):
            if path.isdir(file):
                shutil.rmtree(file)
            else:
                os.remove(file)

    try:
        print("Downloading toolchain...")
        request.urlretrieve(toolchain_url, temp_zip_path)
    except URLError:
        print("Check your network connection!")
        exit(1)
    except BaseException as err:
        print(err)
        print("Inner Core Mod Toolchain installation not completed due to above error.")
        exit(2)

    print("Extracting toolchain...")
    with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
        zip_ref.extractall("./")

    for file in needed_files:
        real_path = path.join(".", root_dir, file)
        if not path.exists(real_path):
            print(f"File not found: {real_path}")
            cleanup()
            exit(1)

        if path.isdir(real_path):
            shutil.copytree(real_path, file)
        else:
            shutil.copyfile(real_path, file)

    is_override_config = False
    with open(path.join("toolchain", "toolchain.json"), "r") as toolchain_config_file:
        toolchain_config = json.load(toolchain_config_file)
        if ("debugIncludesExclude" in toolchain_config
                and "toolchain/declarations/android.d.ts" in toolchain_config["debugIncludesExclude"]):
            toolchain_config["debugIncludesExclude"].remove("toolchain/declarations/android.d.ts")
            is_override_config = True

    if is_override_config:
        with open(path.join("toolchain", "toolchain.json"), "w", encoding="utf-8") as toolchain_config_file:
            json.dump(toolchain_config, toolchain_config_file, indent=4)

    process = subprocess.Popen(
        args=f"python3 -m icmtoolchain selectProject --path {path.abspath('waila-pe')}",
        cwd=path.join("toolchain", "toolchain", "python"),
        shell=True,
    )
    process.communicate()

    print("Cleaning up...")
    cleanup()


if __name__ == '__main__':
    install_toolchain()
