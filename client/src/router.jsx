import { Routes, Route } from 'react-router-dom'

import Form from './pages/Form.page'
import Invoice from './pages/Invoice.page'


const Router = (
    <Routes>
        <Route path="/" element={<Form />} exact />
        <Route path="/invoice/:id" element={<Invoice />} exact />
   
        <Route path="*" element={<Form />} exact />
    </Routes>
)     

export default Router