# promise-web-worker

## Why

创建和使用[Web Workers]（https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers）有时会很麻烦。该插件旨在促进Web Worker 的使用。根据浏览器的兼容性对`web Worker`封装了一层 promise 封装,解决在不支持`web Worker`的浏览器下可能需要书写不同逻辑的可能。同时整理了创建`web Worker`对应的相关事件的消息通信,执行完会自动关闭 worker,通过链式调用获取处理结果。同时为了避免项目中使用`web Worker`需要考虑引用文件的同源策略限制以及 webpack 打包的麻烦，插件使用`URL.createObjectURL`对执行的逻辑函数生成一个 URL 对象，具体逻辑如下：

```
const URL = window.URL || window.webkitURL
const funcStr = utils.makeResponse(func)
const blob = new Blob([funcStr], { type: 'application/javascript' })
const objectURL = URL.createObjectURL(blob)
const worker = new Worker(objectURL)

```

## How to install and use

```
npm install promise-web-worker

or

yarn add promise-web-worker

```

Then:

```
import PromiseWorker from 'promise-web-worker'
```

## Options

**PromiseWorker.isSupportWorker:`Boolean`**

当前浏览器是否支持`web Worker`,在某些场景下可以用于判断，执行个性化的操作

**PromiseWorker.run(func, [args]?):`Function`**

> Where:
>
> - `func`是要在 worker 中运行的函数
> - `[args]`是`func`将使用的可选参数数组

> 此方法创建一个可处理的 Web 工作程序，运行并返回给定函数的结果，并关闭该工作程序.

此方法类似于 Promise.resolve（），但在另一个线程中.
E.g.:

```
PromiseWorker.run(() => 'PromiseWorker run 1: Function in other thread')
  .then(console.log) // logs 'PromiseWorker run 1: Function in other thread'
  .catch(console.error) // logs any possible error

PromiseWorker.run((arg1, arg2) => `PromiseWorker run 2: ${arg1} ${arg2}`, ['Another', 'function in other thread'])
  .then(console.log) // logs 'PromiseWorker run 2: Another function in other thread'
  .catch(console.error) // logs any possible error
```
