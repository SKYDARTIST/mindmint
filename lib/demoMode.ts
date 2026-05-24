const isDisabled = (value: string | undefined) => value === "false";

export const isDemoMode = () => {
    const serverDemoDisabled = isDisabled(process.env.MINDMINT_DEMO_MODE);
    const publicDemoDisabled = isDisabled(process.env.NEXT_PUBLIC_MINDMINT_DEMO_MODE);

    // Stay in demo unless both flags explicitly opt out. This avoids a broken
    // public demo where the client skips auth but the API starts requiring it.
    return !(serverDemoDisabled && publicDemoDisabled);
};
