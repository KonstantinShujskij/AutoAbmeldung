import React from 'react'
import { Button, Flex, Heading, Card, Text, Link } from "@radix-ui/themes"
import bg from '../assets/landingBg.png'


function Landing() {
    return (
        <Flex className="Form" direction="column" gap="5" style={{ maxWidth: 1024, margin: "40px auto", padding: 20 }}>          
            <img className="example-img" src={bg} alt="preview" />
            
            <Heading size="6">REINIGUNGSSERVICE</Heading>

            <Text>
                <p>Wir sind ein professionelles Reinigungsunternehmen und bieten zuverlässige und gründliche Reinigungsdienstleistungen für Privat- und Geschäftskunden an.</p>
                <p>Unser Service umfasst unter anderem die Reinigung von Wohnungen, Häusern, Büros sowie eine gründliche End- und Unterhaltsreinigung. Wir arbeiten sorgfältig, termingerecht und mit modernen Reinigungsmitteln.</p>
            </Text>

            <Heading size="4">Anfahrtspauschale: 100 €</Heading>

            <Text mt="6">
                <h3>Kontakt</h3>

                <Flex style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <Flex gap="2" >
                            <span style={{ width: 78 }}>Telefon:</span>
                            <Link href="tel:+491605698376">+49 160 5698376</Link>
                        </Flex>
                        <Flex gap="2">
                            <span style={{ width: 78 }}>hatsApp:</span>
                            <Link href="https://wa.me/491605698376">+49 160 5698376</Link>
                        </Flex>
                        <Flex gap="2">
                            <span style={{ width: 78 }}>Telegram:</span> 
                            <Link href='https://t.me/LuenenCleanPro'>LuenenCleanPro</Link> 
                        </Flex>
                        <Flex gap="2">
                            <span style={{ width: 78 }}>E-Mail: </span> 
                            <Link  href="mailto:sauberkeit.service.ln@gmail.com">sauberkeit.service.ln@gmail.com</Link>
                        </Flex>
                    </div>
                    <div>
                        <p>Adresse: Münsterstraße 45</p>
                        <p>44534 Lünen Deutschland</p>      
                    </div>
                </Flex>
            </Text>
        </Flex>
    )
}

export default Landing