import { Heading, Box } from '@chakra-ui/react'
import React, { VFC } from 'react'

const Header: VFC = () => {
  return (
    <Box align="center" pb={12}>
      <Heading color="white">Athletics Motion Analysis</Heading>
    </Box>
  )
}

export default Header
