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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Login-Link für {siteName}</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={card}>
          <Text style={brand}>LOMARIA</Text>
          <Hr style={divider} />
          <Heading style={h1}>DEIN LOGIN-LINK</Heading>
          <Text style={text}>
            Klicke auf den Button unten, um dich sicher anzumelden.
            Der Link ist nur kurze Zeit gültig.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              JETZT ANMELDEN
            </Button>
          </Section>
          <Text style={smallText}>
            Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
          </Text>
          <Text style={linkText}>{confirmationUrl}</Text>
          <Hr style={divider} />
          <Text style={footer}>
            Du hast keinen Login angefordert? Dann ignoriere diese E-Mail.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', margin: 0, padding: '40px 20px' }
const outerContainer = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#1F1F1F', padding: '40px 36px', borderRadius: '6px' }
const brand = { color: '#C6A94D', fontSize: '14px', letterSpacing: '0.3em', fontWeight: 600 as const, margin: '0 0 24px', textAlign: 'center' as const }
const divider = { borderColor: '#3a3a3a', borderWidth: '1px 0 0 0', margin: '24px 0' }
const h1 = { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '26px', fontWeight: 400 as const, color: '#ffffff', letterSpacing: '0.15em', margin: '0 0 24px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#e8e8e8', lineHeight: '1.6', margin: '0 0 28px', textAlign: 'center' as const }
const buttonWrap = { textAlign: 'center' as const, margin: '0 0 28px' }
const button = { backgroundColor: '#C6A94D', color: '#1F1F1F', fontSize: '13px', fontWeight: 600 as const, letterSpacing: '0.15em', borderRadius: '6px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '12px', color: '#999999', margin: '0 0 6px', textAlign: 'center' as const }
const linkText = { fontSize: '11px', color: '#C6A94D', wordBreak: 'break-all' as const, textAlign: 'center' as const, margin: 0 }
const footer = { fontSize: '11px', color: '#888888', margin: 0, textAlign: 'center' as const }
