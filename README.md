# mdl-site

MDL 研究室紹介サイト(https://mdl.comp.isct.ac.jp)のリポジトリ。

## 構成

- **ホスティング**: GitHub Pages(このリポジトリの `main` ブランチのルートをそのまま配信。ビルドなし)
- **ドメイン**: `mdl.comp.isct.ac.jp`(`CNAME` ファイル + リポジトリの Pages 設定で指定)
- **CMS**: [Decap CMS](https://decapcms.org/)(`/admin/` からブラウザで編集 → このリポジトリに直接コミットされる)

```
index.html              … トップページ(現状プレースホルダ。自由に差し替え可)
CNAME                   … カスタムドメイン指定(GitHub Pages 用。消さないこと)
.nojekyll               … Jekyll ビルドの無効化(素の HTML 配信)
admin/index.html        … Decap CMS 本体の読み込み
admin/config.yml        … Decap の設定(コレクション定義はプレースホルダ)
content/news/           … ニュース記事(Markdown, Decap が管理)
content/publications/   … 論文エントリ(Markdown, Decap が管理)
assets/uploads/         … Decap からアップロードした画像等
```

## Decap CMS の認証

GitHub Pages にはサーバーがないため、OAuth 中継として **kpro と共用の中継サーバー**
(tamagotake 上の `kpro-oauth` コンテナ、`https://kpro.mdl.comp.isct.ac.jp/oauth/`)を使っている。

- GitHub OAuth App: Client ID `Ov23liE9vbWrMRx9WvwV`(callback は kpro 側のまま。中継方式なので複数サイトで共用可)
- 実体: tamagotake の `/opt/kpro-oauth/`(`server.js`, `.env`)。運用手順は kpro-site リポジトリの README 参照
- `/admin/` にログインできるのは、**このリポジトリに write 権限を持つ GitHub アカウント**のみ

## コンテンツの扱い(引き継ぎメモ)

- `admin/config.yml` の `collections:` 以下はサンプル。サイト設計が決まったらフィールド構成を変更してよい
- 現状は SSG(静的サイトジェネレータ)を使っていないため、`content/` 以下の Markdown を
  トップページに表示するには、①JS で fetch して描画する、②SSG(Eleventy 等)+ GitHub Actions を導入する、
  のどちらかを HTML 担当者が選ぶこと。SSG を入れる場合は Pages の配信元を Actions に切り替える

## DNS

`mdl.comp.isct.ac.jp` は CNAME で `mdl-lab.github.io` に向ける(以前は A 131.112.16.160 =
tamagotake で Google Sites へ 301 リダイレクトしていた)。`kpro.mdl.comp.isct.ac.jp` は
独立の A レコードなので影響なし。
