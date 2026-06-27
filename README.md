# AutoCanvas

汽车销售商专用的商品生图工作台。页面可以直接部署为静态网站，也可以用 Node.js 本地预览。

## 已包含

- 汽车销售首页
- 在售车辆展示区
- 商品详情页上传入口
- 批量上传车辆图片
- 车型信息编辑表单
- 三种营销海报模板
- Canvas 实时预览
- 一键下载 PNG 海报
- 一键复制 AI 生图提示词

## 本地运行

```bash
npm start
```

然后打开：

```text
http://127.0.0.1:4173
```

## 直接部署

这是纯前端静态程序，部署时上传这些文件即可：

- `index.html`
- `styles.css`
- `script.js`
- `assets/`

可部署到 Vercel、Netlify、Cloudflare Pages、宝塔、Nginx 静态站点或任意虚拟主机。
