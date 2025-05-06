const data = {
    name: 'Levie',
    info: {
      age: 25,
      location: 'VN'
    }
  };
  
  const { name, info } = data;
  info.age = 30;
  
  console.log(data.info.age); // 30 ✅ vẫn bị ảnh hưởng
  