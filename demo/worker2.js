function total2() {
  const arr = []
  for (let i = 0; i < 1000; i++) {
    arr.push(i)
  }
  return arr
}
// const arr1 = total2()
// console.log('worker2')
// self.postMessage(arr1)
self.onmessage = function(e) {
  const arr = total2(e.data)
  console.log('worker2', e.data, arr)
  self.postMessage(arr)
}
