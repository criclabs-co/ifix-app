import { Alert } from 'antd'
import type { AlertProps } from 'antd'

// A note that's part of the page: something the reader should know about
// what they're looking at (a rejection note, a locked unit, a missing
// photo set). It reads in order with the rest of the page.
//
// Built on antd's Alert for the look (tinted surface, icon, title and
// secondary description text), with one difference: role="note" instead
// of Alert's role="alert". An alert is a live region, so a screen reader
// reads it out the moment it renders, interrupting whatever the user was
// doing — right for something that just happened (a failed sign-in, a
// lookup with no match), wrong for a note that's on the page every visit.
//
// Use Callout for anything shown with the page; keep antd's Alert for
// feedback to something the user just did. Both are on /design-docs.
export function Callout(props: AlertProps) {
  return <Alert showIcon role="note" {...props} />
}
