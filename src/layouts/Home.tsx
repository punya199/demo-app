const nums = [3, 5, 6, 9, 10, 12, 15]
const sum = []
for (let i = 1; i < nums.length; i++) {
  if (nums[i] % 3 === 0) {
    sum.push(nums[i])
  }
}

const Home = () => {
  return (
    <div>
      <div>สวัสดี ฉันค่อย ๆ ปรากฏขึ้น pcx</div>
    </div>
  )
}

export default Home
