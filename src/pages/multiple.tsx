import { NextPage } from 'next'
import { Layout } from 'components/layout'
import React from 'react'
import { MultipleAnalyze } from 'components/templates'

const multiple: NextPage = () => {
  return (
    <Layout title="Home">
      <MultipleAnalyze />
    </Layout>
  )
}

export default multiple
