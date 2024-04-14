setTimeout(() => {
  fetchUserDataByStreaming();
}, 100);

async function fetchUserDataByStreaming() {
  const response = await fetch('/api/data', {
    method: 'post'
  });

  const body = response.body;
  // 获取可读流对象
  const reader = body.getReader();

  // 创建 TextDecoder 解码
  const textReader = new TextDecoder();
  // 创建一个本次响应的全局 buffer 用于保存已经收到的数据
  let buffer = [];

  function getValueFromReader() {
    reader.read().then((res) => {
      if (res.done) {
        console.log('reader done');
        return;
      }

      if (res.value) {
        const chunk = res.value;
        // 将本次返回数据添加到已返回数据中
        buffer.push(chunk);
        // 所有的数据
        const completeBuffer = mergeArrays(...buffer);
        // 转化时舍弃对应规则
        const textBufferString = textReader.decode(
          computedValidString(completeBuffer)
        );

        const element = document.getElementById('root');
        // 替换为全量数据
        element.innerHTML = textBufferString;

        // 未结束时，继续调用 getValueFromReader 递归读取 fetch 内容
        getValueFromReader();
      }
    });
  }

  getValueFromReader();
}

function computedValidString(buffer) {
  const reg = /^1*/;
  // 截取 count
  let count = 0;
  // 应该
  let shouldCount = 0;

  for (let i = buffer.length - 1; i >= 0; i--) {
    const byte = buffer[i];
    // 转为 2 进制，判断是否为 10 开头（非单个字节）
    const value = byte.toString(2).padStart(8, '0');
    if (!`${value}`.startsWith('10')) {
      // 判断该字符是否满足后续
      // 计算 value 开头的 1 有几个
      console.log(`${value}`, '最后一个完整的字符');
      shouldCount = `${value}`.match(reg)[0].length;
      break;
    } else {
      console.log(`${value}`, '未完整字符');
      count++;
    }
  }

  if (shouldCount === count) {
    return buffer;
  } else {
    return buffer.slice(0, buffer.length - (count + 1));
  }
}

function mergeArrays(...arrays) {
  let out = new Uint8Array(
    arrays.reduce((total, arr) => total + arr.length, 0)
  );
  let offset = 0;
  for (let arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  // 中文情况
  return out;
}
