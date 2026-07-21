# mdl-site

MDL 研究室紹介サイト(https://mdl.comp.isct.ac.jp)のリポジトリ。

## 構成

- **ホスティング**: GitHub Pages(このリポジトリの `main` ブランチのルートをそのまま配信。ビルドなし)
- **ドメイン**: `mdl.comp.isct.ac.jp`(`CNAME` ファイル + リポジトリの Pages 設定で指定)
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms)(Decap CMS 互換。`/admin/` からブラウザで編集 → このリポジトリに直接コミットされる)

```
index.html              … トップページ(現状プレースホルダ。自由に差し替え可)
CNAME                   … カスタムドメイン指定(GitHub Pages 用。消さないこと)
.nojekyll               … Jekyll ビルドの無効化(素の HTML 配信)
admin/index.html        … Sveltia CMS 本体の読み込み
admin/config.yml        … CMS の設定(Decap 互換形式。コレクション定義はプレースホルダ)
content/news/           … ニュース記事(Markdown, CMS が管理)
content/publications/   … 論文エントリ(Markdown, CMS が管理)
assets/uploads/         … CMS からアップロードした画像等
```

## CMS の認証(OAuth 中継なし構成)

OAuth 中継サーバーは**使っていない**。各編集者は `/admin/` のログイン画面で
**「Sign In with Token」**を選び、自分の GitHub Personal Access Token でログインする。

- 編集できるのは、**このリポジトリに write 権限を持つ GitHub アカウント**のみ
- PAT はログイン画面のリンクから必要スコープ選択済みで発行できる(fine-grained token、
  対象リポジトリを mdl-lab/mdl-site に絞るのを推奨)。有効期限(既定90日)が切れたら再発行
- 将来ワンクリックの GitHub ログインにしたい場合は、OAuth 中継(自前コンテナ or
  Cloudflare Workers の [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth))を立てて
  `admin/config.yml` の backend に `base_url` を追加すれば切り替えられる

## コンテンツの扱い(引き継ぎメモ)

- `admin/config.yml` の `collections:` 以下はサンプル。サイト設計が決まったらフィールド構成を変更してよい
- 現状は SSG(静的サイトジェネレータ)を使っていないため、`content/` 以下の Markdown を
  トップページに表示するには、①JS で fetch して描画する、②SSG(Eleventy 等)+ GitHub Actions を導入する、
  のどちらかを HTML 担当者が選ぶこと。SSG を入れる場合は Pages の配信元を Actions に切り替える

## DNS

`mdl.comp.isct.ac.jp` は CNAME で `mdl-lab.github.io` に向ける(以前は A 131.112.16.160 =
tamagotake で Google Sites へ 301 リダイレクトしていた)。`kpro.mdl.comp.isct.ac.jp` は
独立の A レコードなので影響なし。
