#!/bin/bash
docker exec 6b bash -c "python hello.py; cd modifiedDiffusion; python hello.py; sh executeModifiedDiffusion.sh"