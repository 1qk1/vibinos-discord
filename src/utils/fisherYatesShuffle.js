export default
  (arr) => {
    let
      array = arr,
      count = array.length,
      randomnumber,
      temp;
    while (count) {
      randomnumber = Math.random() * count-- | 0;
      temp = array[count];
      array[count] = array[randomnumber];
      array[randomnumber] = temp
    }
    return array
  }
