/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Login-Link für {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>LOMARIA</Text>
        <Heading style={h1}>Dein Login-Link</Heading>
        <Text style={text}>
          Klicke auf den Button, um dich bei {siteName} anzumelden. Der Link ist nur kurz gültig.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Anmelden
        </Button>
        <Text style={footer}>
          Falls du diesen Link nicht angefordert hast, ignoriere diese E-Mail einfach.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Josefin Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '480px', margin: '0 auto' }
const brand = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#C6A94D',
  letterSpacing: '3px',
  textTransform: 'uppercase' as const,
  margin: '0 0 30px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1F1F1F',
  margin: '0 0 20px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}
const text = {
  fontSize: '14px',
  color: '#555555',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: '#C6A94D',
  color: '#1F1F1F',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '6px',
  padding: '12px 24px',
  textDecoration: 'none',
  letterSpacing: '0.5px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
