import BookList from '@/components/BookList';
import React from 'react'

const page = () => {
  return (
    <>
        <BookList title='Borrowed Books' books={sampleBooks} />
    </>
  )
}

export default page