/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Bestätigungscode</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={card}>
          <Text style={brand}>LOMARIA</Text>
          <Hr style={divider} />
          <Heading style={h1}>BESTÄTIGUNGSCODE</Heading>
          <Text style={text}>
            Gib diesen Code ein, um deine Identität zu bestätigen:
          </Text>
          <Section style={tokenWrap}>
            <Text style={tokenStyle}>{token}</Text>
          </Section>
          <Text style={smallText}>
            Der Code ist nur kurze Zeit gültig.
          </Text>
          <Hr style={divider} />
          <Text style={footer}>
            Du hast diese Bestätigung nicht angefordert? Dann ignoriere diese E-Mail.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', margin: 0, padding: '40px 20px' }
const outerContainer = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#1F1F1F', padding: '40px 36px', borderRadius: '6px' }
const brand = { color: '#C6A94D', fontSize: '14px', letterSpacing: '0.3em', fontWeight: 600 as const, margin: '0 0 24px', textAlign: 'center' as const }
const divider = { borderColor: '#3a3a3a', borderWidth: '1px 0 0 0', margin: '24px 0' }
const h1 = { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '26px', fontWeight: 400 as const, color: '#ffffff', letterSpacing: '0.15em', margin: '0 0 24px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#e8e8e8', lineHeight: '1.6', margin: '0 0 20px', textAlign: 'center' as const }
const tokenWrap = { textAlign: 'center' as const, margin: '0 0 24px' }
const tokenStyle = { fontFamily: '"Courier New", monospace', fontSize: '32px', letterSpacing: '0.4em', color: '#C6A94D', backgroundColor: '#0f0f0f', padding: '20px', borderRadius: '6px', margin: 0, fontWeight: 600 as const }
const smallText = { fontSize: '12px', color: '#999999', margin: '0 0 6px', textAlign: 'center' as const }
const footer = { fontSize: '11px', color: '#888888', margin: 0, textAlign: 'center' as const }
