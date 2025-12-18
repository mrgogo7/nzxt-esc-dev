// Application mode detection and routing logic

/**
 * Determines if the application should run in Kraken Browser mode.
 * Kraken mode is activated when URL contains ?kraken=1 parameter.
 */
export function isKrakenView(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const params = new URLSearchParams(window.location.search);
  return params.get('kraken') === '1';
}
