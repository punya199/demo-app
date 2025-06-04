import { Button } from 'antd'

const nums = [3, 5, 6, 9, 10, 12, 15]
const sum = []
for (let i = 1; i < nums.length; i++) {
  if (nums[i] % 3 === 0) {
    sum.push(nums[i])
  }
}

const Home = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <Button type="primary">กดฉันสิ</Button>
    </div>
  )
}

export default Home
