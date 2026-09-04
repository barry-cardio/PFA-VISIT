# PFA Center Visit Checklist

移动端优先的中英双语 PFA 中心拜访记录工具，可作为普通静态网页或 PWA 使用。

## 使用

1. 通过 HTTPS 地址打开网页；首次联网加载完成后可离线继续使用。
2. 页面内可新建、复制、删除并切换多条记录。
3. 点击底部“保存PDF”，在系统打印界面选择“存储为PDF”。报告只显示已填写内容。
4. 点击“更多”导出 JSON；下次通过“导入记录”恢复并继续编辑。

重要：页面不使用 localStorage、IndexedDB、后台数据库或统计代码。刷新或关闭页面前，请先导出 JSON。请勿输入患者姓名、患者 ID 或其他患者个人信息。

## GitHub Pages 部署

建议仓库名：`pfa-center-visit-checklist`。

```bash
git init
git add .
git commit -m "Initial PFA center visit checklist"
git branch -M main
git remote add origin https://github.com/<account>/pfa-center-visit-checklist.git
git push -u origin main
```

在 GitHub 仓库的 **Settings → Pages** 中，将 Source 设为 **Deploy from a branch**，选择 `main` 和 `/ (root)`。所有资源均使用相对路径，可在项目子路径下运行。

## 本地预览

不要直接双击文件测试离线/PWA功能；Service Worker 需要 HTTP 或 HTTPS。

```bash
python3 -m http.server 4177
```

然后打开 `http://localhost:4177/`。

## 数据文件

- JSON 顶层：`schemaVersion`、`exportedAt`、`language`、`records[]`
- 每条记录：`id`、`createdAt`、`updatedAt`、`values`
- 当前 schema version：`1`

