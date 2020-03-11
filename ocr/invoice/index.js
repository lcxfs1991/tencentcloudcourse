const Koa = require('koa');
const app = new Koa();
const co = require('co');
const render = require('koa-swig');
const serve = require('koa-static');
const koaBody = require('koa-body');
const path = require('path');
const fs = require('fs');
const { TaxiInvoiceOCRPromise } = require('./TaxiInvoiceOCR');

let templatePath = path.resolve('./view/');
let staticPath = path.resolve('./static/');

// 模板渲染
app.context.render = co.wrap(
  render({
    root: templatePath,
    autoescape: true,
    cache: false,
    ext: 'html'
  })
);

// 处理静态文件
app.use(serve(staticPath));

app.use(
  koaBody({
    multipart: true,
    formLimit: 10000
  })
);

app.use(async ctx => {
  let req = ctx.request;
  let url = req.url;
  let method = req.method;

  if (url === '/' && method === 'GET') {
    await ctx.render('index');
  } else if (url === '/' && method === 'POST') {
    let file = ctx.request.files.invoice;

    if (!file || !file.path) {
      return (ctx.body = {
        code: 1,
        msg: 'file not exists',
        data
      });
    }

    let content = fs.readFileSync(file.path).toString('base64');
    // console.log(content);

    try {
      let result = await TaxiInvoiceOCRPromise(content);
      let data = JSON.parse(result);
      console.log(result);

      ctx.body = {
        code: 0,
        msg: 'success',
        data
      };
    } catch (e) {
      console.log(e);
      ctx.body = {
        code: 1,
        msg: e.message
      };
    }
  }
});

app.listen(3000, function(err) {
  if (err) {
    console.error(err);
  } else {
    console.info(
      `Listening on port %s. Open up http://localhost:%s/ in your browser.`,
      3000,
      3000
    );
  }
});
