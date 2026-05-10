import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { forgotUserPassword } from "../../features/auth/authThunks";

const ForgotPassowrdPage = () => {
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    dispatch(forgotUserPassword(email));
  };

  return (
    <section class="bg-slate-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <h1 className="items-center mb-6 text-2xl font-bold text-gray-900 dark:text-white ">Eventora</h1>
        <div class="w-full p-6 rounded-lg shadow dark:border md:mt-0 sm:max-w-md bg-gray-800 border-gray-700 sm:p-8">
            <h1 class="mb-1 text-xl font-bold leading-tight tracking-tight text-white">
                Forgot your password?
            </h1>
            <p class="font-light text-gray-400">Don't fret! Just type in your email and we will send you a code to reset your password!</p>
            <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={handleSubmit}   >
                <div>
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Your email</label>
                    <input type="email" name="email" id="email" class="border text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="name@company.com" required=""/>
                </div>
                <div class="flex items-start">
                    <div class="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 border-gray-600 focus:ring-primary-600 ring-offset-gray-800" required=""/>
                    </div>
                    <div class="ml-3 text-sm">
                        <label for="terms" class="font-light text-gray-300">I accept the <a class="font-medium text-primary-600 hover:underline text-primary-500" href="#">Terms and Conditions</a></label>
                    </div>
                </div>
                <button type="submit" class="w-full text-white bg-purple-700 cursor-pointer focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-primary-800">Reset password</button>
            </form>
        </div>
    </div>
    </section>
  )
};

export default ForgotPassowrdPage;