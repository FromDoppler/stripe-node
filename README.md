# At First Time in local env

1. clone the repository, 
2. Uncomment the line located in the file docker-composer.yml

~~~
#command: "tail -f /dev/null"
~~~

3. run npm install command manually inside the container.
 This will create the node_modules folder and the composer-lock file.

4. comment the mentioned line again.

5. run compose restart

6. Go to [http://localhost:4242/checkout.html](http://localhost:4242/checkout.html)