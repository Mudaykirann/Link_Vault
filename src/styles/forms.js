export const formStyles = {
    input: (theme, error) => `
        w-full p-3 rounded-lg border 
        transition-colors duration-200 
        outline-none
        ${error
            ? 'border-red-500'
            : theme === 'light'
                ? 'border-[#E5E7EB] focus:border-[#2563EB] bg-white text-[#1F2937]'
                : 'border-[#334155] focus:border-[#FACC15] bg-[#1E293B] text-[#F9FAFB]'
        }
    `,
    label: (theme) => `
        block mb-2 font-medium 
        ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}
    `,
    container: (theme) => `
        p-8 rounded-xl border 
        ${theme === 'light'
            ? 'bg-white border-[#E5E7EB]'
            : 'bg-[#1E293B] border-[#334155]'
        }
    `
} 