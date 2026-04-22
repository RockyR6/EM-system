import React from 'react'

const Loading = () => {
  return (
    <div className='flex h-screen justify-center items-center'>
      <div className='animate-spin size-8 border-2 border-indigo-600 border-t-transparent rounded-full'></div>
    </div>
  )
}

export default Loading
