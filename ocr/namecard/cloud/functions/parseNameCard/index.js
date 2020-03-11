// 补充BusinessCardOCR逻辑


exports.main = async (event) => {
  const url = event.url;
  console.log(url);

  try {
    let result = await BusinessCardOCR(url);
    console.log(result);
    let body = JSON.parse(result);


    return body.BusinessCardInfos 
    ? {code: 0, msg: 'success', data: body.BusinessCardInfos} 
    : { code: 1, msg: 'error' };
  }
  catch (e) {
    return {
      code: 1,
      msg: e.message
    }
  }
};