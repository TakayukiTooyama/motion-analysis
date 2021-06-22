import { Layout } from 'components/layout'
import { NextPage } from 'next'
import { Analyze } from 'components/templates'

const HomePage: NextPage = () => {
  return (
    <Layout title="Home">
      <Analyze />
    </Layout>
  )
}

export default HomePage
