# !/bin/bash
set -euo pipefail

DST_SUBDIR=""
[ "${CI_COMMIT_REF_NAME}" != "${CI_DEFAULT_BRANCH}" ] && DST_SUBDIR="${CI_COMMIT_REF_NAME}"
DST_PATH="public/${DST_SUBDIR}"

echo "Creating directory ${DST_PATH}"
mkdir -p ${DST_PATH}
echo "Installing website in ${DST_PATH}"
cp -R index.html media ${DST_PATH}/