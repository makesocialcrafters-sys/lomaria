/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Bestätige deine neue E-Mail-Adresse</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={card}>
          <Text style={brand}>LOMARIA</Text>
          <Hr style={divider} />
          <Heading style={h1}>NEUE E-MAIL BESTÄTIGEN</Heading>
          <Text style={text}>
            Du möchtest deine E-Mail-Adresse ändern:
          </Text>
          <Text style={emailLine}>
            <span style={emailOld}>{email}</span>
            <span style={arrow}> → </span>
            <span style={emailNew}>{newEmail}</span>
          </Text>
          <Text style={text}>
            Klicke auf den Button unten, um die Änderung zu bestätigen.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              ÄNDERUNG BESTÄTIGEN
            </Button>
          </Section>
          <Text style={smallText}>
            Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
          </Text>
          <Text style={linkText}>{confirmationUrl}</Text>
          <Hr style={divider} />
          <Text style={footer}>
            Du hast diese Änderung nicht angefordert? Dann ignoriere diese E-Mail.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', margin: 0, padding: '40px 20px' }
const outerContainer = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#1F1F1F', padding: '40px 36px', borderRadius: '6px' }
const brand = { color: '#C6A94D', fontSize: '14px', letterSpacing: '0.3em', fontWeight: 600 as const, margin: '0 0 24px', textAlign: 'center' as const }
const divider = { borderColor: '#3a3a3a', borderWidth: '1px 0 0 0', margin: '24px 0' }
const h1 = { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '24px', fontWeight: 400 as const, color: '#ffffff', letterSpacing: '0.12em', margin: '0 0 24px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#e8e8e8', lineHeight: '1.6', margin: '0 0 16px', textAlign: 'center' as const }
const emailLine = { fontSize: '14px', color: '#e8e8e8', textAlign: 'center' as const, margin: '0 0 24px' }
const emailOld = { color: '#999999' }
const emailNew = { color: '#C6A94D', fontWeight: 600 as const }
const arrow = { color: '#666666', margin: '0 8px' }
const buttonWrap = { textAlign: 'center' as const, margin: '0 0 28px' }
const button = { backgroundColor: '#C6A94D', color: '#1F1F1F', fontSize: '13px', fontWeight: 600 as const, letterSpacing: '0.15em', borderRadius: '6px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '12px', color: '#999999', margin: '0 0 6px', textAlign: 'center' as const }
const linkText = { fontSize: '11px', color: '#C6A94D', wordBreak: 'break-all' as const, textAlign: 'center' as const, margin: 0 }
const footer = { fontSize: '11px', color: '#888888', margin: 0, textAlign: 'center' as const }
