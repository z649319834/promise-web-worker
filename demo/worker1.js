importScripts('./worker2.js')

function total1(len) {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

async function getdata(id = '599dcce2998a6b40b1e38e8c600c0004') {
  return await fetch(
    `https://resapi-dev.jiaoyanyun.com/web/baseItem/querySelectList?subjectId=1&gradeGroupId=1&examTypeId=${id}`
  ).then(function(response) {
    const data = response.json()
    console.log('fetch', data)
    return data
  })
}

self.onmessage = function({ data }) {
  const arr = total1(data.len)
  const arr1 = total2(data.len)
  getdata(data.id).then(source => {
    console.log('worker1', data, arr, arr1, source)
    self.postMessage({ arr, arr1, source: source.data })
  })
}
