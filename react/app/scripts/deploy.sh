# RUN THIS FROM THE ROOT FOLDER
printf "\n\nDEPLOY CLIENT TO PRODUCTION?!?!?!?!?!?!?g\n\n\n"
read -p "Are you sure? " -n 1 -r
echo    # (optional) move to a new line

if [[ ! $REPLY =~ ^[Yy]$ ]]
then

      printf "Good Call! Phew, that was  close one.\n"

    exit 1
fi

yarn build
cp -fr build/* docs/

# Increment the semver patch number
npm version patch 
# Get the current version
version=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

cd docs
git add .
git commit -m "[DEPLOY CLIENT]: v.$version"
git push

cd ..
git add package.json
git commit -m "[DEPLOY CLIENT]: v.$version"
git push