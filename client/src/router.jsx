import { Routes, Route } from 'react-router-dom'

import Form from './pages/Form.page'
import Invoice from './pages/Invoice.page'
import Offerte from './pages/Offert.page'
import Daten from './pages/Daten.page'


const Router = (
    <Routes>
        <Route path="/" element={<Form />} exact />
        <Route path="/offerte" element={<Offerte />} exact />
        <Route path="/daten" element={<Daten />} exact />
        <Route path="/invoice/:id" element={<Invoice />} exact />
   
        <Route path="*" element={<Form />} exact />
    </Routes>
)     

export default Router