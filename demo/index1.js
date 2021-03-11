import simpleWebWorker from 'simple-web-worker'

const PromiseWorker = (function() {
  return window.Worker
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
                throw new Error(err)
              }
            } else {
              throw new Error(
                '第一个参数为function,第二个参数第一个参数的实参数组'
              )
            }
          })
        },
        queue: [],
        create(actions) {
          queue.push(...actions)
          return this
        },
        postAll(msgArr) {
          return new Promise((resolve, reject) => {
            const result = []
            try {
              if (Array.isArray(msgArr) && msgArr.length) {
                this.queue.forEach((item, index) => {
                  if (msgArr.includes(item.message)) {
                    this.run(item.func).then(data => {
                      result.push(data)
                      this.queue.splice(index, 1)
                    })
                  }
                })
              } else {
                this.queue.forEach(item => {
                  if (typeof item.func === 'function') {
                    result.push(item.func())
                  } else {
                    result.push(undefined)
                  }
                })
                this.queue = []
              }
              resolve(result)
            } catch (err) {
              reject(result)
              throw new Error(err)
            }
          })
        }
      }
})()

export default PromiseWorker
