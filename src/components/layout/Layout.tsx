import { Container, Box } from '@chakra-ui/react'
import Head from 'next/head'
import React, { FC } from 'react'
import Header from './Header'

type Props = {
  title: string
}

const Layout: FC<Props> = ({ children, title }) => (
  <Box bgGradient="linear(to-l, #7928CA, #FF0080)" pt={12}>
    <Head>
      <title>{title}</title>
    </Head>
    <Header />
    <Container as="main" maxW="xl" bg="white" shadow="base" pt={2}>
      {children}
    </Container>
  </Box>
)

export default Layout
