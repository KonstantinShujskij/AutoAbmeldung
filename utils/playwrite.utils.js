const config = require('config')
const { chromium } = require('playwright')


async function fillLunen(context, invoice) {
    const page = await context.newPage()
    await page.goto('https://i-kfz.regioit.de/i4/ikfz4/?LICENSEIDENTIFIER=unna_kreis', { waitUntil: 'domcontentloaded', timeout: 45000 })
    
    await new Promise(r => setTimeout(r, 500))
    await page.click('#agreement_acceptui')
    await new Promise(r => setTimeout(r, 100))
    await page.click('#action_start_next')
    await new Promise(r => setTimeout(r, 500))
    await page.getByRole('button', { name: 'Antrag auf Außerbetriebsetzung' }).click()
    await new Promise(r => setTimeout(r, 100))
    await page.click('#action_antragauswahl_next')
    await new Promise(r => setTimeout(r, 500))
    await page.fill('#ausserbetriebsetzung_1fahrzeug_fin', invoice.VIN)
    await new Promise(r => setTimeout(r, 100))
    await page.fill('#ausserbetriebsetzung_1fahrzeug_akz', invoice.Number)
    await new Promise(r => setTimeout(r, 100))
    await page.click('#action_ausserbetriebsetzung_1fahrzeug_next')
    await new Promise(r => setTimeout(r, 500))
    await page.selectOption('#ausserbetriebsetzung_5verbleib_fahrzeugverbleib', '1')
    await new Promise(r => setTimeout(r, 100))
    await page.click('#action_ausserbetriebsetzung_3verbleib_next')
    await new Promise(r => setTimeout(r, 500))
    await page.selectOption('#ausserbetriebsetzung_7reservierung_reservierung', 'NEIN')
    await new Promise(r => setTimeout(r, 100))
    await page.click('#action_ausserbetriebsetzung_5reservierung_next')
    await new Promise(r => setTimeout(r, 500))

    await page.fill('#ausserbetriebsetzung_4codes_zb1', invoice.zbI)
    await new Promise(r => setTimeout(r, 100))
    await page.fill('#ausserbetriebsetzung_4codes_2kz_vorn', invoice.front)
    await new Promise(r => setTimeout(r, 100))
    await page.fill('#ausserbetriebsetzung_4codes_2kz_hinten', invoice.back)
    await new Promise(r => setTimeout(r, 100))
    await page.click('#action_ausserbetriebsetzung_7codes_next')
    await new Promise(r => setTimeout(r, 500))
    await page.click('#action_all_topopup_antragdetails')
    await new Promise(r => setTimeout(r, 500))
    
    const antragsnummer = await page.locator('.mdg_row', { hasText: 'Antragsnummer:' }).locator('.mdg_value span').textContent()
    console.log(antragsnummer?.trim())
    await page.click('#action_popup_messagebox_close')
    await new Promise(r => setTimeout(r, 500))

    await page.click('#action_antrag_confirm_next')
    await new Promise(r => setTimeout(r, 500))
    await page.click('#action_antrag_payment_to_payment')
    await new Promise(r => setTimeout(r, 500))
    await page.click('#action_antrag_payment_popup_payment_ok')
    await new Promise(r => setTimeout(r, 500))

    // ishkov.k.n@gmail.com

    await page.click('#creditcardSubmitButton')
    await new Promise(r => setTimeout(r, 500))
    await new Promise(r => setTimeout(r, 100))
    await page.fill('#cardholder', "Denys Ishkov")
    await new Promise(r => setTimeout(r, 100))
    await page.fill('#pan', "4441111022694289")  
    await new Promise(r => setTimeout(r, 100))
    await page.selectOption('#expiry_month', '12')
    await new Promise(r => setTimeout(r, 100))
    await page.selectOption('#expiry_year', '29')
    await new Promise(r => setTimeout(r, 100))
    await page.fill('#cvc', "979")
    await new Promise(r => setTimeout(r, 500))
    await page.click('#entry_form_submit')
    await new Promise(r => setTimeout(r, 5000))
    await page.fill('#cvc', "979")
    await new Promise(r => setTimeout(r, 500))
    await page.locator('input[name="customer_addr_street"]').fill("Am Heikenberg 2")
    await page.fill("#customer_addr_zip", "44534")
    await page.fill("#customer_addr_city", "Lünen")
    await page.locator('input[name="customer_email"]').fill("cultxodyssey@gmail.com")
    await new Promise(r => setTimeout(r, 500))
    await page.click('#entry_form_submit')

    await new Promise(r => setTimeout(r, 120000))
    return antragsnummer
}

async function fillForm(invoice) {
    let browser = null
    let context = null

    try {
        browser = await chromium.launch({ 
            headless: true, 
            // args: [`--proxy-server=${proxy.host}:${proxy.port}`] 
        })
        context = await browser.newContext({
            // ignoreHTTPSErrors: true,
            // proxy: {
            //     server: `${proxy.host}:${proxy.port}`,
            //     username: proxy.username,
            //     password: proxy.password,
            // },
        })

        await context.addCookies([
            {
                name: 'nsid',
                value: 's%3ASM-qPJh_DOKRtASQ8oSaZHwFG97CO3gH.5DcqW2yjELWABDNqm41A1reQ6TNuAXpiCl054IMDKKY',
                domain: '.paypal.com',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            }
        ])

        return await fillLunen(context, invoice)
    } catch(err) {
        console.warn(`Попытка не удалась...`, err)

        await new Promise(r => setTimeout(r, 1000))
    } finally {
        if(browser) { await browser.close() }
    }

    return true
}


module.exports = {
    fillForm
}
