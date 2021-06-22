import { Layout } from 'components/layout'
import Analyze from 'components/templates/Analyze'
import { NextPage } from 'next'

const HomePage: NextPage = () => {
  return (
    <Layout title="Home">
      <Analyze />
    </Layout>
  )
}

export default HomePage
