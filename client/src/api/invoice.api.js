const API_URL = "http://127.0.0.1:5555/api/invoice"


async function uploadFile(endpoint, file, email) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("email", email)

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

export const parseZBII = async (file, email) => await uploadFile("ZBII", file, email)
export const parseZBI  = async (file, email) => await uploadFile("ZBI", file, email)
export const parseFront = async (file, email) => await uploadFile("front", file, email)
export const parseBack  = async (file, email) => await uploadFile("back", file, email)

export const create = async (email, zbI, zbII, back, front) => {
    try {
        const res = await fetch(`${API_URL}/create`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, zbI, zbII, back, front })
        })
        if(!res.ok) { return { ok: false, error: `Server returned ${res.status}` }}

        const data = await res.json()
        return { ok: true, data }
    } 
    catch(err) {
        return { ok: false, error: err.message }
    }
}

export const make = async (email) => {
    try {
        const res = await fetch(`${API_URL}/email`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
        if(!res.ok) { return { ok: false, error: `Server returned ${res.status}` }}

        const data = await res.json()
        return { ok: true, data }
    } 
    catch(err) {
        return { ok: false, error: err.message }
    }
}
