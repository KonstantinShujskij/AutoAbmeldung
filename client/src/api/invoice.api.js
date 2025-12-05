const API_URL = "http://127.0.0.1:5555/api/invoice"


async function uploadFile(endpoint, file) {
    const formData = new FormData()
    formData.append("file", file)

    try {
        const res = await fetch(`${API_URL}/${endpoint}`, { method: "POST", body: formData })
        if(!res.ok) { return { ok: false, error: `Server returned ${res.status}` }}

        const data = await res.json()
        return { ok: true, data }

    } 
    catch(err) {
        return { ok: false, error: err.message }
    }
}

export const parseZBII = async (file) => await uploadFile("ZBII", file)
export const parseZBI  = async (file) => await uploadFile("ZBI", file)
export const parseFront = async (file) => await uploadFile("front", file)
export const parseBack  = async (file) => await uploadFile("back", file)
