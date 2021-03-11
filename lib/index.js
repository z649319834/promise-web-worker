const utils = {
  // 验证是否支持web worker
  isValidat() {
    if (!window.Worker) {
      console.error('This browser does not support web Worker.')
      return false
    }
    if (!(window.URL.createObjectURL || window.webkitURL.createObjectURL)) {
      console.error('This browser does not have URL.createObjectURL method.')
      return false
    }
    return true
  },
  // 创建worker
  createWorker(isSupportWorker) {
    if (isSupportWorker) {
      return function(func) {
        const URL = window.URL || window.webkitURL
        const funcStr = utils.makeResponse(func)
        const blob = new Blob([funcStr], { type: 'application/javascript' })
        const objectURL = URL.createObjectURL(blob)
        const worker = new Worker(objectURL)
        worker.post = function(args) {
          return new Promise(function(resolve, reject) {
            worker.onmessage = event => {
              URL.revokeObjectURL(objectURL) // 释放URL.createObjectURL创建的对象URL
              resolve(event.data)
            }
            worker.onerror = e => {
              URL.revokeObjectURL(objectURL) // 释放URL.createObjectURL创建的对象URL
              console.error(
                `Error: Line ${e.lineno} in ${e.filename}: ${e.message}`
              )
              reject(e)
            }
            worker.postMessage({ args })
          })
        }
        return worker
      }
    } else {
      return function(func) {
        const worker = {
          post(args) {
            return new Promise(function(resolve, reject) {
              try {
                const data = func(...args)
                resolve(data)
              } catch (err) {
                reject(err)
                throw new Error(err)
              }
            })
          }
        }
        return worker
      }
    }
  },
  // 包装函数,
  makeResponse: func => `
    self.onmessage = (event) => {
      const args = event.data.args||[]
      const response = (${func}).apply(null,args)
      if((typeof response === 'object' && typeof response.then === 'function')|| response instanceof Promise){
        return response.then(function(res){
          self.postMessage(res)
          return close()
        })
      }
      self.postMessage(response)
      return close()
    }
  `
}
const isSupportWorker = utils.isValidat()
const PromiseWorker = {
  isSupportWorker: isSupportWorker,
  createWorker: utils.createWorker(isSupportWorker),
  run(func, args = []) {
    if (typeof func !== 'function') {
      throw new Error(
        'The first argument should provide a function \nReceived: func'
      )
    }
    if (args === undefined || !Array.isArray(args)) {
      throw new Error(
        'The second argument should provide an array \nReceived: args'
      )
    }
    const worker = PromiseWorker.createWorker(func)

    return worker.post(args)
  }
}
export default PromiseWorker
