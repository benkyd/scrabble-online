

function ShuffleArray(array)
{
    let length = array.length;
    let index;
    let temp;

    while (length)
    {
        index = Math.floor(Math.random() * length);
        length--;

        temp = array[length];
        array[length] = array[index];
        array[index] = temp;
    }
  
    return array;
}

module.exports = {
    ShuffleArray: ShuffleArray
};
