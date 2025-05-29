const nums = [3, 5, 6, 9, 10, 12, 15]
const sum = []
for (let i = 1; i < nums.length; i++) {
  if (nums[i] % 3 === 0) {
    sum.push(nums[i])
  }
}
console.log(sum)
const Home = () => {
  return (
    <div>
      <div>สวัสดี ฉันค่อย ๆ ปรากฏขึ้น...</div>
    </div>
  )
}

export default Home
