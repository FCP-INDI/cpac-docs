export async function urlExistsWithoutRedirect(url: URL): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      cache: 'no-store'
    });

    // Check if it's a redirect
    if ([301, 302, 303, 304, 307, 308].includes(response.status)) {
      console.log('Redirect detected to:', response.headers.get('Location'));
      return false;
    }

    return response.ok; // true if status is 2xx
  } catch (error) {
    console.error('Error checking URL:', error);
    return false;
  }
}
