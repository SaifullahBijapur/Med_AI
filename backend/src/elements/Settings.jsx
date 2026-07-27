import React from 'react'
import SettingsCard from './settings/SettingsCard'
import HospitalInfoCard from './settings/HospitalInfoCard'
const Settings = () => {
  return (
    <div className='flex flex-col md:flex-row gap-4'>
      <SettingsCard/>
      <HospitalInfoCard />
    </div>
  )
}

export default Settings
