/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>E-Mail-Änderung bestätigen für {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>LOMARIA</Text>
        <Heading style={h1}>E-Mail-Änderung bestätigen</Heading>
        <Text style={text}>
          Du hast eine Änderung deiner E-Mail-Adresse für {siteName} angefragt — von{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          zu{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Button style={button} href={confirmationUrl}>
          Änderung bestätigen
        </Button>
        <Text style={footer}>
          Falls du diese Änderung nicht angefordert hast, sichere dein Konto bitte umgehend.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link = { color: '#C6A94D', textDecoration: 'underline' }
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
