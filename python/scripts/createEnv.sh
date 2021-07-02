#! /bin/bash

# On OSX you must have run `brew install gdal` so that the header files are findable 
python3 -m venv --system-site-packages .venv
.venv/bin/python -m pip install --upgrade pip
# .venv/bin/pip --timeout=120 install \
#   Cython==0.29.7 \
#   numpy==1.16.3 \
#   shapely==1.7.0 \
#   scipy==1.5.1 \
#   --no-binary shapely

# Need numpy before GDAL
# .venv/bin/pip install \
#   GDAL==$(gdal-config --version) \
#   --global-option=build_ext \
#   --global-option="-I/usr/include/gdal"

# Now install everything else
.venv/bin/pip --timeout=120 install -r requirements.txt
