import React from 'react'

const Loading = () => {
  return (
      <div className="h-screen justify-center items-center flex">
        <div className="poppins-extrabold text-3xl text-center text-white space-y-4">
          <h3>Cinephiles</h3>
          <div className="">
            <span className="loading loading-spinner loading-lg text-white/80"></span>
          </div>
        </div>
      </div>
  )
}

export default Loading