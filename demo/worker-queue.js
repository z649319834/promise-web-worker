import simpleWebWorker from 'simple-web-worker'

class PromiseWorker {
  constructor() {
    this.worker = this.getWorker()
    return this.getInstance()
  }

  getInstance() {
    if (!PromiseWorker.instance) {
      this.getConcurrency()
      PromiseWorker._runState = false // 执行状态
      PromiseWorker._runConcurrencyTotal = 0
      PromiseWorker._instance = this
    }
    return PromiseWorker._instance
  }

  // 添加队列执行
  push(fn, args, callback) {
    if (!Array.isArray(PromiseWorker._queue)) {
      PromiseWorker._queue = []
    }
    PromiseWorker._queue.push({ fn, args, callback })
    if (PromiseWorker._runState) return this
    return this.run()
  }

  run() {
    PromiseWorker._runState = true
    const { _queue, _concurrency, _runConcurrencyTotal } = PromiseWorker
    while (_queue.length && _concurrency > _runConcurrencyTotal) {
      PromiseWorker._runConcurrencyTotal++
      const { fn, args, callback } = _queue.shift()
      this.worker
        .run(fn, args)
        .then(res => {
          typeof callback === 'function' && callback(res)
          PromiseWorker._runConcurrencyTotal--
          this.run()
        })
        .catch(e => {
          PromiseWorker._runState = false
          throw e
        })
    }
    PromiseWorker._runState = false
    return this
  }

  // 判断浏览器环境是否支持worker
  getWorker() {
    if (!PromiseWorker._worker) {
      PromiseWorker._worker = window.Worker
        ? simpleWebWorker
        : {
            name: 'PromiseWorker',
            run(callback, arg = []) {
              return new Promise(function(resolve, reject) {
                if (typeof callback === 'function') {
                  try {
                    const data = callback(...arg)
                    resolve(data)
                  } catch (err) {
                    reject()
                  }
                } else {
                  throw new Error(
                    '第一个参数为function,第二个参数第一个参数的实参数组'
                  )
                }
              })
            },
            create: simpleWebWorker.create
          }
    }
    return PromiseWorker._worker
  }

  // 获取当前浏览器环境所拥有的CPU核心数
  getConcurrency() {
    let concurrency = PromiseWorker._concurrency
    if (typeof concurrency !== 'number') {
      if (window && window.navigator && window.navigator.hardwareConcurrency) {
        concurrency = window.navigator.hardwareConcurrency
      } else {
        console.warn(
          "Set 2 Concurrency,because can't get your hardwareConcurrency."
        )
        concurrency = 2
      }
      PromiseWorker._concurrency = concurrency
    }
    return concurrency
  }
  // 获取正在使用的内核数量
  getRunConcurrencyTotal() {
    return PromiseWorker._runConcurrencyTotal
  }

  // 待执行的队列
  getQueue() {
    return PromiseWorker._queue
  }
}
const a = new PromiseWorker()
const b = new PromiseWorker()
// console.log(a.run, b.push, PromiseWorker._concurrency)
export default PromiseWorker
