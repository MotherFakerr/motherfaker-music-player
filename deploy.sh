# 删除dist, 否则第二次会提示fatal: A branch named 'main' already exists.
rm -rf webpack/dist

# # 发生错误时终止
set -e

# # 构建
pnpm build

# # 进入构建文件夹
cd webpack/dist

# 如果你要部署到自定义域名
# echo 'www.example.com' > CNAME

git init
git checkout -b main
git add -A
git commit -m 'deploy'


# 如果你要部署在 https://<USERNAME>.github.io/<REPO>
git push -f https://github.com/MotherFakerr/github-music-player-page.git main:gh-pages

cd -

rm -rf webpack/dist